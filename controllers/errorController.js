const errorController = {}

errorController.triggerError = async function (req, res, next) {
    try {
        throw new Error("Intentional 500 error for testing.")
    } catch (err) {
        next(err)
    }
}

module.exports = errorController