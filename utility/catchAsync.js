//wrapper instead of try/catching routes
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}