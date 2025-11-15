module.exports = function (RED) {
    const axios = require("axios");

    function DwdRainradarNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const t = (key, opts) =>
            RED._("node-red-contrib-dwd-rainradar/dwd-rainradar:" + key, opts);

        node.mode          = config.mode || "de";
        node.latMin        = config.latMin;
        node.latMax        = config.latMax;
        node.lonMin        = config.lonMin;
        node.lonMax        = config.lonMax;
        node.lat           = config.lat;
        node.lon           = config.lon;
        node.radius        = config.radius;
        node.autoRefresh   = Number(config.autoRefresh || 0);
        node.fetchOnDeploy = config.fetchOnDeploy !== false;
        node.outputSummary = config.outputSummary !== false;
        node.outputGrid    = !!config.outputGrid;
        node.outputImage   = !!config.outputImage;
        node.diag          = !!config.diag;

        let timer = null;

        function setStatus(text, color = "blue", shape = "dot") {
            node.status({ fill: color, shape, text });
        }

        async function fetchRadar() {
            setStatus(t("runtime.statusLoading"));

            try {
                // TODO: echte DWD-Radar-Integration (RADOLAN)
                // Hier erstmal Dummy-Daten, damit der Node nutzbar ist.

                const now = new Date().toISOString();

                const payload = {
                    meta: {
                        source: "DWD Rain Radar (dummy)",
                        timestamp: now,
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

                setStatus(t("runtime.statusOk", { count: node.outputGrid ? 100 : 0 }), "green", "dot");
                node.send({ payload });
            } catch (err) {
                const msg = err && err.message ? err.message : String(err);
                node.error(t("runtime.errorFetch", { error: msg }));
                setStatus(t("runtime.statusError"), "red", "ring");
            }
        }

        function schedule() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }

            const s = Number(node.autoRefresh || 0);
            if (s > 0) {
                timer = setInterval(fetchRadar, s * 1000);
            }
        }

        node.on("input", fetchRadar);

        node.on("close", () => {
            if (timer) clearInterval(timer);
        });

        schedule();

        if (node.fetchOnDeploy) {
            fetchRadar();
        } else {
            setStatus(t("runtime.statusReady"), "blue", "ring");
        }
    }

    RED.nodes.registerType("dwd-rainradar", DwdRainradarNode);
};