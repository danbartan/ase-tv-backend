import express from "express";
import Database from "better-sqlite3";

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const db = new Database("data.db");
db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prenume TEXT NOT NULL,
    nume TEXT NOT NULL,
    email TEXT NOT NULL,
    telefon TEXT NOT NULL,
    facultate TEXT NOT NULL,
    anDeStudiu INTEGER CHECK (anDeStudiu BETWEEN 1 AND 3) NOT NULL,
    optional TEXT
    )
`);

const insert = db.prepare(
    "INSERT INTO submissions (nume, prenume, telefon, email, facultate, anDeStudiu, optional) VALUES (@nume, @prenume, @telefon, @email, @facultate, @anDeStudiu, @optional)" 
)

app.post("/Submit", (req, res) => {
    let {prenume, nume, email, telefon, facultate, anDeStudiu, optional} = req.body || {}

    

    if (!prenume || !nume || !email || !telefon || !facultate || !anDeStudiu) {
        return res.status(400).json({error: "Required information is missing"});
    }
    
    anDeStudiu = Number(anDeStudiu);

    if (!Number.isInteger(anDeStudiu) || anDeStudiu < 1 || anDeStudiu > 3)
    {
        return res.status(400).json({error: "Anul de studiu trebuie sa fie intre 1 si 3 si sa fie un numar intreg"});
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({error: "Email invalid"})
    }
    if (!/^0\d{9}$/.test(telefon)) {
        return res.status(400).json({error: "Numarul de telefon trebuie sa aiba 10 cifre si sa inceapa cu 0"})
    }

    try {
        const result = insert.run({nume, prenume, telefon, email, facultate, anDeStudiu, optional: optional || null});
        res.status(201).json({id: result.lastInsertRowid});
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Eroare la salvarea datelor"})
    }

});

app.listen(3000, () => {
        console.log("Listening on http://localhost:3000");
    })
