const Visit = require('../models/Visit');

class VisitController {
    // Listar todas as visitas
    async index(req, res) {
        try {
            const {
                status,
                page = 1,
                limit = 10,
                startDate,
                endDate,
                consultant,
                property,
                client
            } = req.query;

            let query = {};

            // Filtros
            if (status) {
                query.status = status;
            }

            if (consultant) {
                query.$or = [
                    { consultantRequested: consultant },
                    { consultantResponsible: consultant }
                ];
            }

            if (property) {
                query.property = property;
            }

            if (client) {
                query.client = client;
            }

            // Filtro por data
            if (startDate || endDate) {
                query.scheduledDate = {};
                if (startDate) query.scheduledDate.$gte = new Date(startDate);
                if (endDate) query.scheduledDate.$lte = new Date(endDate);
            }

            const visits = await Visit.find(query)
                .populate('property', 'title address')
                .populate('client', 'name email phone')
                .populate('consultantRequested', 'name')
                .populate('consultantResponsible', 'name')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ scheduledDate: 1 });

            const total = await Visit.countDocuments(query);

            return res.json({
                data: visits,
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

    // Buscar uma visita específica
    async show(req, res) {
        try {
            const visit = await Visit.findById(req.params.id)
                .populate('property', 'title address photos')
                .populate('client', 'name email phone')
                .populate('consultantRequested', 'name email phone')
                .populate('consultantResponsible', 'name email phone');

            if (!visit) {
                return res.status(404).json({
                    error: 'Visita não encontrada'
                });
            }

            return res.json(visit);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Criar nova visita
    async store(req, res) {
        try {
            const {
                property,
                client,
                scheduledDate,
                consultantResponsible
            } = req.body;

            const visit = await Visit.create({
                property,
                client,
                scheduledDate,
                consultantRequested: req.user.id,
                consultantResponsible,
                agency: req.user.agency
            });

            return res.status(201).json(visit);
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

    // Atualizar status da visita para executada
    async markAsExecuted(req, res) {
        try {
            const {
                executionDate,
                duration,
                visitNotes
            } = req.body;

            const visit = await Visit.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'EXECUTED',
                    executionDate,
                    duration,
                    visitNotes
                },
                { new: true }
            );

            if (!visit) {
                return res.status(404).json({
                    error: 'Visita não encontrada'
                });
            }

            return res.json(visit);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Cancelar visita
    async cancel(req, res) {
        try {
            const { cancellationReason } = req.body;

            const visit = await Visit.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'CANCELLED',
                    cancellationReason
                },
                { new: true }
            );

            if (!visit) {
                return res.status(404).json({
                    error: 'Visita não encontrada'
                });
            }

            return res.json(visit);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Reagendar visita
    async reschedule(req, res) {
        try {
            const { newDate, reason } = req.body;
            const visit = await Visit.findById(req.params.id);

            if (!visit) {
                return res.status(404).json({
                    error: 'Visita não encontrada'
                });
            }

            visit.rescheduleHistory.push({
                oldDate: visit.scheduledDate,
                newDate,
                reason,
                changedBy: req.user.id
            });

            visit.scheduledDate = newDate;
            visit.status = 'RESCHEDULED';

            await visit.save();

            return res.json(visit);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
}

module.exports = new VisitController();