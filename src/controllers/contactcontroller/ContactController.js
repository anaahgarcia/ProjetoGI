const Contact = require('../models/Contact');

class ContactController {
    // Listar todos os contatos
    async index(req, res) {
        try {
            const { 
                type,
                page = 1,
                limit = 10,
                search
            } = req.query;

            let query = {};

            if (type) {
                query.type = type;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ];
            }

            const contacts = await Contact.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await Contact.countDocuments(query);

            return res.json({
                data: contacts,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // Buscar um contato
    async show(req, res) {
        try {
            const contact = await Contact.findById(req.params.id);

            if (!contact) {
                return res.status(404).json({
                    error: 'Contato não encontrado'
                });
            }

            return res.json(contact);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // Criar novo contato
    async store(req, res) {
        try {
            const {
                name,
                email,
                phone,
                type,
                status,
                address,
                notes,
                agency,
                consultant
            } = req.body;

            const existingContact = await Contact.findOne({ email });

            if (existingContact) {
                return res.status(400).json({
                    error: 'Email já cadastrado'
                });
            }

            const contact = await Contact.create({
                name,
                email,
                phone,
                type,
                status,
                address,
                notes,
                agency,
                consultant
            });

            return res.status(201).json(contact);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar contato
    async update(req, res) {
        try {
            const contact = await Contact.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!contact) {
                return res.status(404).json({
                    error: 'Contato não encontrado'
                });
            }

            return res.json(contact);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // Deletar contato
    async delete(req, res) {
        try {
            const contact = await Contact.findByIdAndDelete(req.params.id);

            if (!contact) {
                return res.status(404).json({
                    error: 'Contato não encontrado'
                });
            }

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // Converter Lead em Cliente
    async convertLeadToClient(req, res) {
        try {
            const { clientType } = req.body;

            const contact = await Contact.findById(req.params.id);

            if (!contact || contact.type !== 'LEAD') {
                return res.status(404).json({
                    error: 'Lead não encontrado'
                });
            }

            contact.type = clientType;
            contact.status = 'CONVERTED';
            await contact.save();

            return res.json(contact);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new ContactController();