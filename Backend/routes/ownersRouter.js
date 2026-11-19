const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const OwnersSchema = require("../models/owner-schema");


if (process.env.NODE_ENV === "development") {
    router.post("/create", async (req, res) => {
        try {
        const { fullName, email, password, contact } = req.body;
        let dbl_Check = await OwnersSchema.find({email:email})
       if(dbl_Check.length > 0) return res.send("you have already owner")
        else{

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const admin = await OwnersSchema.create({
                fullName,
                email,
                password: hash,
                contact
            });

            res.status(201).json(admin);
        
        }
        }  catch (err) {
            res.status(500).json({ error: err.message });
        }
    
    });
}

router.get("/", (req, res) => {
    res.send("hey I am owner's");
});

module.exports = router;
