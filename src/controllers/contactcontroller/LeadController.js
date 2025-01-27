// controllers/LeadController.js
const Lead = require('../models/Lead');

class LeadController {
    // Listar todos os leads
    async index(req, res) {
        try {
            const {
                status,
                page = 1,
                limit = 10,
                search,
                consultant,
                source
            } = req.query;

            let query = {};

            if (status) {
                query.status = status;
            }

            if (consultant) {
                query.consultant = consultant;
            }

            if (source) {
                query.source = source;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ];
            }

            const leads = await Lead.find(query)
                .populate('consultant', 'name email')
                .populate('agency', 'name')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await Lead.countDocuments(query);

            return res.json({
                data: leads,
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

    // Buscar um lead específico
    async show(req, res) {
        try {
            const lead = await Lead.findById(req.params.id)
                .populate('consultant', 'name email')
                .populate('agency', 'name');

            if (!lead) {
                return res.status(404).json({
                    error: 'Lead não encontrado'
                });
            }

            return res.json(lead);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Criar novo lead
    async store(req, res) {
        try {
            const existingLead = await Lead.findOne({ email: req.body.email });

            if (existingLead) {
                return res.status(400).json({
                    error: 'Email já cadastrado como lead'
                });
            }

            const lead = await Lead.create({
                ...req.body,
                lastContact: new Date()
            });

            return res.status(201).json(lead);
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

    // Atualizar lead
    async update(req, res) {
        try {
            const lead = await Lead.findByIdAndUpdate(
                req.params.id,
                { ...req.body, lastContact: new Date() },
                { new: true, runValidators: true }
            );

            if (!lead) {
                return res.status(404).json({
                    error: 'Lead não encontrado'
                });
            }

            return res.json(lead);
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

    // Adicionar nota ao lead
    async addNote(req, res) {
        try {
            const { text } = req.body;
            const userId = req.user.id; // Assumindo que você tem o usuário autenticado

            const lead = await Lead.findByIdAndUpdate(
                req.params.id,
                {
                    $push: {
                        notes: {
                            text,
                            createdBy: userId
                        }
                    },
                    lastContact: new Date()
                },
                { new: true }
            );

            if (!lead) {
                return res.status(404).json({
                    error: 'Lead não encontrado'
                });
            }

            return res.json(lead);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Atribuir lead a um consultor
    async assignConsultant(req, res) {
        try {
            const { consultantId } = req.body;

            const lead = await Lead.findByIdAndUpdate(
                req.params.id,
                {
                    consultant: consultantId,
                    lastContact: new Date()
                },
                { new: true }
            );

            if (!lead) {
                return res.status(404).json({
                    error: 'Lead não encontrado'
                });
            }

            return res.json(lead);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Marcar lead como perdido
    async markAsLost(req, res) {
        try {
            const { reason } = req.body;

            const lead = await Lead.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'LOST',
                    $push: {
                        notes: {
                            text: `Lead marcado como perdido. Motivo: ${reason}`,
                            createdBy: req.user.id
                        }
                    },
                    lastContact: new Date()
                },
                { new: true }
            );

            if (!lead) {
                return res.status(404).json({
                    error: 'Lead não encontrado'
                });
            }

            return res.json(lead);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
}

module.exports = new LeadController();