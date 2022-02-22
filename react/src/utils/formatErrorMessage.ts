const formatErrorMessage = (
    code: string,
    message: string | null | undefined,
    source: string | null | undefined
) => {
    let serverMessage;
    if (code.startsWith('5') && !message) {
        switch (code) {
            case '404':
                serverMessage = 'No variants found matching your query.';
                break;
            case '500':
                serverMessage = 'Internal Server Error';
                break;
            case '501':
                serverMessage = 'Not implemented';
                break;
            case '502':
                serverMessage = 'Bad Gateway';
                break;
            case '503':
                serverMessage = 'Service Unavailable';
                break;
            case '504':
                serverMessage = 'Gateway Timeout';
                break;
            case '505':
                serverMessage = 'HTTP Version Not Supported';
                break;
            case '506':
                serverMessage = 'Variant Also Negotiates';
                break;
            case '507':
                serverMessage = 'Insufficient Storage';
                break;
            case '508':
                serverMessage = 'Loop Detected';
                break;
            case '510':
                serverMessage = 'Not Extended';
                break;
            case '511':
                serverMessage = 'Network Authentication Required';
                break;
            default:
                serverMessage = 'A server error has occurred.';
        }
    } else {
        serverMessage = message;
    }
    const sourceMessage = source && !!source.length ? `(Source: ${source})` : '';
    return `Error: ${code} - ${serverMessage} ${sourceMessage}`;
};

export default formatErrorMessage;
