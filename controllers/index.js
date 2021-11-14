module.exports = (app) => {
    app.use("/api/user", require('./user/user.route'));
    app.use("/api/auth", require('./auth/auth.route'));
    app.use("/api/util", require('./util/util.route'));
    app.use("/api/wellBeing",require('./well-being/well-being.route'));
}
