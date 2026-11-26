const userOnly = (req, res, next) => {
    if (req.role !== "user") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    next();
};