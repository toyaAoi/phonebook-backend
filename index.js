const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

morgan.token("body-content", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body-content"
  )
);

let data = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  res.send(`
    <p>
      Phonebook has info for ${data.length} people
      <br/>
      ${new Date().toString()}
    </p>
  `);
});

app.get("/api/persons", (req, res) => {
  res.json(data);
});

app.get("/api/persons/:id", (req, res) => {
  const person = data.find((e) => e.id === Number(req.params.id));
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const exists = data.some((e) => e.id === Number(req.params.id));
  if (exists) {
    data = data.filter((e) => e.id !== Number(req.params.id));
    res.status(204).end();
  } else {
    res.status(404).end();
  }
});

const idGenerator = () => {
  while (true) {
    const randomId = Math.floor(Math.random() * 1000);
    const available = !data.some((e) => e.id === randomId);
    if (available) {
      return randomId;
    }
  }
};

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

  if (data.some((e) => e.name.toLowerCase() === body.name.toLowerCase())) {
    return res.status(409).json({ error: "name must be unique" });
  }

  const person = {
    id: idGenerator(),
    name: body.name,
    number: body.number,
  };

  data = data.concat(person);
  res.json(person);
});

const PORT = 3001;
app.listen(PORT, () => console.log("server running on port " + PORT));
