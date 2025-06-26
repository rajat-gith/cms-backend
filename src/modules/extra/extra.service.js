const {
    AwardHonor,
    Interest,
    Language,
    Volunteering,
    Extracurricular,
} = require("./extra.model");

// Type → Model mapping
const modelMap = {
    "award-honor": AwardHonor,
    interest: Interest,
    language: Language,
    volunteering: Volunteering,
    extracurricular: Extracurricular,
};

// Singular Entity Name mapping for dynamic function generation
const entityMap = {
    "award-honors": { model: AwardHonor, singular: "AwardHonor" },
    interests: { model: Interest, singular: "Interest" },
    languages: { model: Language, singular: "Language" },
    volunteering: { model: Volunteering, singular: "Volunteering" },
    extracurricular: { model: Extracurricular, singular: "Extracurricular" },
};

const getModel = (type) => {
    const entry = modelMap[type];
    if (!entry) throw new Error(`❌ Invalid schema type: ${type}`);
    return entry;
};

const ExtraService = {
    async create(type, userId, data) {
        const Model = getModel(type);
        return await Model.create({ ...data, userId });
    },

    async getAll(type, userId) {
        const Model = getModel(type);
        return await Model.find({ userId });
    },

    async update(type, id, userId, data) {
        const Model = getModel(type);
        return await Model.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        });
    },

    async remove(type, id, userId) {
        const Model = getModel(type);
        return await Model.findOneAndDelete({ _id: id, userId });
    },
};

for (const [type, { model, singular }] of Object.entries(entityMap)) {
    const functionName = `get${singular}sByUser`;
    ExtraService[functionName] = async (userId) => {
        return await model.find({ userId });
    };
}

module.exports = ExtraService;
