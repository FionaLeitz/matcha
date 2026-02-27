export const sanitize = async(regexStr, sizeMax, input) => {
    const regex = new RegExp(regexStr, 'u');
    if (Array.isArray(input)){
        for (let i = 0; i < input.length; i++) {
            if (!input[i].match(regex))
                return {
                    success: false,
                    message: "forbidden char"
                }
            if (input[i].length > sizeMax)
                return {
                    success: false,
                    message: "length"
            }
        }
    }
    else {
        if (!input.match(regex))
            return {
                success: false,
                message: "forbidden char"
            }
        if (input.length > sizeMax)
            return {
                success: false,
                message: "length"
        }
    }

    return { success: true }
};