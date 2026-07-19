export const findOne = async({model,filter={},select="",populate=[]}={}) => {
    return await model.findOne(filter).select(select).populate(populate);
}

export const findById = async({model,id,select="",populate=[]}={}) => {
    return await model.findById(id).select(select).populate(populate);
}

export const find = async({model,filter={},select="",populate=[]}={}) => {
    return await model.find(filter).select(select).populate(populate);
}

export const create = async({model,data=[],options={validateBeforeSave:true}}={}) => {
    return await model.create(data,options);
}

export const updateOne = async({model,filter={},update={}}={}) => {
    return await model.findOneAndUpdate(filter,update,{new:true});
}

export const deleteOne = async({model,filter={}}={}) => {
    return await model.findOneAndDelete(filter);
}

export const deleteMany = async({model,filter={}}={}) => {
    return await model.deleteMany(filter);
}