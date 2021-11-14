const saveToken = async (tokenObj, models) => {
    try {
        const token = await models.user_token.create(tokenObj);
        return token.tokenID;
    } catch (e) {
        console.log(e)
        
    }
};
module.exports = {
    saveToken
};