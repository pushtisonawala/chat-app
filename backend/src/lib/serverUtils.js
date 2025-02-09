import net from 'net';

export const checkPortAvailable = (port) => {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', () => resolve(false))
            .once('listening', () => {
                tester.once('close', () => resolve(true)).close();
            })
            .listen(port);
    });
};

export const findAvailablePort = async (startPort = 5001) => {
    let port = startPort;
    while (!(await checkPortAvailable(port))) {
        port++;
        if (port > 5010) {
            throw new Error('No available ports found in range 5001-5010');
        }
    }
    return port;
};
