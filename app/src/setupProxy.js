const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/object_info/",
        createProxyMiddleware({
            target: "http://0.0.0.0:8188",
            changeOrigin: true,
        })
    );
    app.use(
        "/prompt/",
        createProxyMiddleware({
            target: "http://0.0.0.0:8188",
            changeOrigin: true,
        })
    );
    app.use(
        "/view",
        createProxyMiddleware({
            target: "http://0.0.0.0:8188",
            changeOrigin: true,
        })
    );
};
