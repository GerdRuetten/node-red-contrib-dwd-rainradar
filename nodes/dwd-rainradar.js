module.exports = function (RED) {
    const axios = require("axios");

    function DwdRainradarNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const t = (key, opts) =>
            RED._("node-red-contrib-dwd-rainradar/dwd-rainradar:" + key, opts);

        // Konfiguration aus dem Editor (defensiv)
        node.mode          = config.mode || "de";
        node.latMin        = config.latMin;
        node.latMax        = config.latMax;
        node.lonMin        = config.lonMin;
        node.lonMax        = config.lonMax;
        node.lat           = config.lat;
        node.lon           = config.lon;
        node.radius        = config.radius;
        node.autoRefresh   = Number(config.autoRefresh || 0);
        node.outputSummary = config.outputSummary !== false;
        node.outputGrid    = !!config.outputGrid;
        node.outputImage   = !!config.outputImage;
        node.diag          = !!config.diag;

        // NEU: Backend-URL (optional)
        node.backendUrl    = (config.backendUrl || "").trim();

        // fetchOnDeploy: sauber auf Boolean bringen, Default = true
        if (typeof config.fetchOnDeploy === "undefined") {
            node.fetchOnDeploy = true;
        } else {
            node.fetchOnDeploy = !!config.fetchOnDeploy;
        }

        let timer = null;

        function diagLog(msg) {
            if (node.diag) {
                node.log("[diag] " + msg);
            }
        }

        function setStatus(text, color = "blue", shape = "dot") {
            node.status({ fill: color, shape, text });
        }

        async function fetchRadar() {
            setStatus(t("runtime.statusLoading"));

            try {
                let payload;
                const nowIso = new Date().toISOString();

                if (node.backendUrl) {
                    // ECHTER Modus: Backend-Endpoint wird aufgerufen
                    diagLog("Fetching rain radar from backend: " + node.backendUrl);
                    const res = await axios.get(node.backendUrl, { timeout: 15000 });

                    payload = res.data || {};
                    if (typeof payload !== "object" || payload === null) {
                        payload = {};
                    }

                    // Minimal-Normalisierung, falls Backend nicht alles liefert
                    if (!payload.meta) {
                        payload.meta = {};
                    }
                    if (!payload.meta.timestamp) {
                        payload.meta.timestamp = nowIso;
                    }
                    if (!payload.meta.source) {
                        payload.meta.source = "DWD Rain Radar (backend)";
                    }
                    if (!payload.meta.mode) {
                        payload.meta.mode = node.mode;
                    }
                } else {
                    // DUMMY: Interne Testdaten (aktuelles Verhalten)
                    diagLog("Using built-in dummy implementation (no backendUrl configured)");

                    payload = {
                        meta: {
                            source: "DWD Rain Radar (dummy)",
                            timestamp: nowIso,
                            mode: node.mode
                        }
                    };

                    if (node.outputSummary) {
                        payload.summary = {
                            hasRain: true,
                            maxIntensity: 12.3,
                            avgIntensity: 1.7,
                            coveragePercent: 42.0
                        };
                    }

                    if (node.outputGrid) {
                        payload.grid = {
                            width: 10,
                            height: 10,
                            values: Array.from({ length: 100 }, (_, i) => (i % 5 === 0 ? 5 : 0))
                        };
                    }

                    if (node.outputImage) {
                        payload.image = {
                            mimeType: "image/png",
                            data: null // später: Base64-Bild
                        };
                    }
                }

                const cellCount =
                    payload &&
                    payload.grid &&
                    Array.isArray(payload.grid.values)
                        ? payload.grid.values.length
                        : 0;

                setStatus(t("runtime.statusOk", { count: cellCount }), "green", "dot");
                diagLog("fetchRadar() completed, cells=" + cellCount);

                node.send({ payload });
            } catch (err) {
                const msg = err && err.message ? err.message : String(err);
                node.error(t("runtime.errorFetch", { error: msg }), { error: msg });
                setStatus(t("runtime.statusError"), "red", "ring");
                diagLog("fetchRadar() error: " + msg);
            }
        }

        function schedule() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }

            const s = Number(node.autoRefresh || 0);
            if (s > 0) {
                diagLog("Auto-refresh enabled: " + s + "s");
                timer = setInterval(fetchRadar, s * 1000);
            } else {
                diagLog("Auto-refresh disabled");
            }
        }

        node.on("input", (msg) => {
            diagLog("Input received, triggering fetchRadar()");
            fetchRadar();
        });

        node.on("close", () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            diagLog("Node closed");
        });

        diagLog(
            "Node created, fetchOnDeploy=" +
            node.fetchOnDeploy +
            ", autoRefresh=" +
            node.autoRefresh +
            ", backendUrl=" +
            (node.backendUrl || "<empty>")
        );

        schedule();

        // Fetch nicht synchron im Constructor, sondern im nächsten Tick
        if (node.fetchOnDeploy) {
            diagLog("Fetch on deploy is enabled, scheduling immediate fetch");
            try {
                if (typeof setImmediate === "function") {
                    setImmediate(fetchRadar);
                } else {
                    process.nextTick(fetchRadar);
                }
            } catch (e) {
                diagLog("Failed to schedule immediate fetch, calling directly");
                fetchRadar();
            }
        } else {
            setStatus(t("runtime.statusReady"), "blue", "ring");
        }
    }

    RED.nodes.registerType("dwd-rainradar", DwdRainradarNode);
};