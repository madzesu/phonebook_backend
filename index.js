const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static('build'));

morgan.token('post-req-body', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-req-body'));


let persons = [
    {
        name: 'arto hellas',
        number: '61231231',
        id: 1
    },
    {
        name: 'Ada Lovelace',
        number: '39-44-5323523',
        id: 2
    },
    {
        name: 'Dan Abramov',
        number: '12-43-234345',
        id: 3
    },
    {
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
        id: 4
    }
];

app.get('/', (req, res) => {
    res.send('<h1>Hello world!</h1>');
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(p => p.id === id);
    if (person) {
        return res.json(person);
    }
    res.status(404).end();
});

const generateId = (max = 10000000) => {
    return Math.floor(Math.random() * Math.floor(max));
};

const personExists = name =>
    persons.find(p => p.name.toLowerCase() === name.toLowerCase());

const validatePersonPost = req => {
    const body = req.body;

    const fields = ['name', 'number'];
    const errors = fields.reduce((currentErrors, field) => {
        if (!body[field]) {
            return {
                ...currentErrors,
                [field]: 'required field'
            }
        }
        if (field === 'name' && personExists(body.name)) {
            return {
                ...currentErrors,
                [field]: 'name must be unique'
            };
        }
        return currentErrors;
    }, {});

    console.log('errors:', errors)

    return errors;
};

app.post('/api/persons', (req, res) => {
    const body = req.body;

    const errors = validatePersonPost(req);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    };

    persons = persons.concat(person);

    res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);

    persons = persons.filter(p => p.id !== id);

    res.status(204).end();
});

app.get('/info', (req, res) => {
    const infoContent = `
        <div>
            <div>Phonebook has info for ${persons.length} people</div>
            <div>${new Date()}</div>
        </div>
    `;
    res.send(infoContent);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`server started and is listening port ${PORT}`);
});
