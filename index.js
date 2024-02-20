require("dotenv").config();
const express = require("express");
const Person = require("./models/person");
// const morgan = require("morgan");
const app = express();
const cors = require("cors");

// morgan.token("body-content", function (req, res) {
//   return JSON.stringify(req.body);
// });

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
// app.use(
//   morgan(
//     ":method :url :status :res[content-length] - :response-time ms :body-content"
//   )
// );

app.get("/info", (req, res) => {
  Person.find({}).then((response) => {
    res.send(`
    <p>
    Phonebook has info for ${response.length} people
    <br/>
    ${new Date().toString()}
    </p>
    `);
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((person) => {
    res.json(person);
  });
});

app.get("/api/persons/:id", (req, res) => {
  console.log(req.params);
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => {
      res.status(404).end();
    });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((person) => {
      Person.deleteOne({ _id: req.params.id }).then((response) => {
        res.json(person).end();
      });
    })
    .catch((error) => {
      res.status(404).end();
    });
});

// const idGenerator = () => {
//   while (true) {
//     const randomId = Math.floor(Math.random() * 1000);
//     const available = !data.some((e) => e.id === randomId);
//     if (available) {
//       return randomId;
//     }
//   }
// };

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!(body.name || body.number)) {
    return res.status(400).json({ error: "name and number is missing" });
  }

  if (body.name && !body.number) {
    return res.status(400).json({ error: "number is missing" });
  }

  if (!body.name && body.number) {
    return res.status(400).json({ error: "name is missing" });
  }

  Person.find({}).then((response) => {
    const person = response.find(
      (e) => e.name.toLowerCase() == body.name.toLowerCase()
    );

    if (person) {
      return res.status(400).json({ error: "name must be unique" });
    }

    const newPerson = new Person({
      name: body.name,
      number: body.number,
    });

    newPerson.save().then((response) => {
      res.json(response);
    });
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("server running on port " + PORT));
