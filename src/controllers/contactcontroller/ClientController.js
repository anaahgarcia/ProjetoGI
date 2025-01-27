const Client = require('../models/Client');

class ClientController {
    // Listar todos os clientes
    async index(req, res) {
        try {
            const {
                type,
                status,
                page = 1,
                limit = 10,
                search,
                consultant,
                agency
            } = req.query;

            let query = {};

            if (type) {
                query.type = type;
            }

            if (status) {
                query.status = status;
            }

            if (consultant) {
                query.consultant = consultant;
            }

            if (agency) {
                query.agency = agency;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ];
            }

            const clients = await Client.find(query)
                .populate('consultant', 'name email')
                .populate('agency', 'name')
                .populate('properties.property', 'title address')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await Client.countDocuments(query);

            return res.json({
                data: clients,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Buscar um cliente específico
    async show(req, res) {
        try {
            const client = await Client.findById(req.params.id)
                .populate('consultant', 'name email')
                .populate('agency', 'name')
                .populate('properties.property', 'title address price')
                .populate('convertedFromLead', 'source createdAt');

            if (!client) {
                return res.status(404).json({
                    error: 'Cliente não encontrado'
                });
            }

            return res.json(client);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Criar novo cliente
    async store(req, res) {
        try {
            const existingClient = await Client.findOne({ email: req.body.email });

            if (existingClient) {
                return res.status(400).json({
                    error: 'Email já cadastrado'
                });
            }

            const client = await Client.create({
                ...req.body,
                agency: req.user.agency // Assumindo que o usuário logado pertence a uma agência
            });

            return res.status(201).json(client);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Erro de validação',
                    details: error.message
                });
            }

            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Atualizar cliente
    async update(req, res) {
        try {
            const client = await Client.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!client) {
                return res.status(404).json({
                    error: 'Cliente não encontrado'
                });
            }

            return res.json(client);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Erro de validação',
                    details: error.message
                });
            }

            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Adicionar interesse em propriedade
    async addPropertyInterest(req, res) {
        try {
            const { propertyId, status } = req.body;

            const client = await Client.findByIdAndUpdate(
                req.params.id,
                {
                    $push: {
                        properties: {
                            property: propertyId,
                            status,
                            date: new Date()
                        }
                    }
                },
                { new: true }
            );

            if (!client) {
                return res.status(404).json({
                    error: 'Cliente não encontrado'
                });
            }

            return res.json(client);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Adicionar nota ao cliente
    async addNote(req, res) {
        try {
            const { text } = req.body;
            const userId = req.user.id;

            const client = await Client.findByIdAndUpdate(
                req.params.id,
                {
                    $push: {
                        notes: {
                            text,
                            createdBy: userId
                        }
                    }
                },
                { new: true }
            );

            if (!client) {
                return res.status(404).json({
                    error: 'Cliente não encontrado'
                });
            }

            return res.json(client);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Atualizar documentos do cliente
    async updateDocuments(req, res) {
        try {
            const { documents } = req.body;

            const client = await Client.findByIdAndUpdate(
                req.params.id,
                { documents },
                { new: true }
            );

            if (!client) {
                return res.status(404).json({
                    error: 'Cliente não encontrado'
                });
            }

            return res.json(client);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
}

module.exports = new ClientController();