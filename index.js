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

app.get("/info", (req, res, next) => {
  Person.find({})
    .then((response) => {
      res.send(`
    <p>
    Phonebook has info for ${response.length} people
    <br/>
    ${new Date().toString()}
    </p>
    `);
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((person) => {
      res.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/api/persons/:id", (req, res, next) => {
  console.log(req.params);
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      Person.deleteOne({ _id: req.params.id }).then(() => {
        res.json(person).end();
      });
    })
    .catch((error) => {
      next(error);
    });
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

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

    newPerson
      .save()
      .then((response) => {
        res.json(response);
      })
      .catch((error) => {
        next(error);
      });
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("server running on port " + PORT));
