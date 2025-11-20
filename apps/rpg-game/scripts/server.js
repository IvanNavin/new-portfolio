const path = require('path');
const Hapi = require('@hapi/hapi');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;

const FILES = /\.(js|js.map|woff|woff2|svg|bmp|jpg|jpeg|gif|png|ico)(\?v=\d+\.\d+\.\d+)?$/;

const PATH = {
    '/': 'index.html'
}

const init = async () => {
    const server = Hapi.server({
        port,
        host: '0.0.0.0', // Allow external connections (required for Render)
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    await server.register(require('@hapi/inert'));

    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: (request, h) => {
            if (FILES.test(request.path)) {
                return h.file(path.join(process.cwd(), 'dist', request.path))
            }

            return h.file(path.join(process.cwd(), 'dist', PATH[request.path]))
        }
    })

    await server.start();

    console.log('Server running on %s', server.info.uri);

    // Socket.io setup
    const io = new Server(server.listener, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Game Logic
        socket.on('join', (playerName) => {
            console.log('Player joined:', playerName);
            const newPlayer = {
                id: socket.id,
                name: playerName,
                skin: 'boy1', // Default skin
                col: 1,
                row: 1,
                layer: 1,
            };

            // In a real backend, we would store players in a DB or memory
            // For now, we just echo back to the client as if they joined
            // and tell everyone else about the new player
            
            // Mocking the response expected by ClientApi.onJoin
            // It expects { player: current_player_obj, playersList: [all_players] }
            // Since we don't have persistent state in this simple script, 
            // we'll just send back the current player as the only player for now,
            // or we could try to maintain a simple in-memory list.
            
            // Let's try a simple in-memory list
            socket.data.player = newPlayer;
            
            const playersList = [];
            io.sockets.sockets.forEach((s) => {
                if (s.data.player) {
                    playersList.push(s.data.player);
                }
            });

            socket.emit('join', {
                player: newPlayer,
                playersList: playersList
            });

            socket.broadcast.emit('newPlayer', newPlayer);
        });

const world = require('../src/configs/world.json');

// ... (inside init)

        socket.on('move', (dir) => {
            const player = socket.data.player;
            if (!player) return;

            const dirs = {
                up: [0, -1],
                right: [1, 0],
                down: [0, 1],
                left: [-1, 0],
            };

            const [dCol, dRow] = dirs[dir];
            const newCol = player.col + dCol;
            const newRow = player.row + dRow;

            // Collision detection
            if (newCol < 0 || newRow < 0 || newRow >= world.map.length || newCol >= world.map[0].length) {
                return;
            }

            const cell = world.map[newRow][newCol];
            // Check if the bottom layer (terrain) is 'grass'
            // cell structure: [ [layer0_obj], [layer1_obj], ... ]
            // layer0_obj structure: ["type", ...]
            const terrainType = cell[0][0];
            
            if (terrainType !== 'grass') {
                return;
            }
            
            const oldCol = player.col;
            const oldRow = player.row;
            
            player.col = newCol;
            player.row = newRow;

            io.emit('playerMove', {
                id: socket.id,
                col: player.col,
                row: player.row,
                oldCol,
                oldRow
            });
        });

        // Chat Logic
        socket.on('start', (name) => {
             // Chat start event, similar to join but for chat specific logic if needed
             // The original code emitted 'start' with name
             io.emit('chat connection', {
                 time: Date.now(),
                 msg: `${name} connected`,
                 id: socket.id
             });
             
             // Update online count
             io.emit('chat online', { online: io.engine.clientsCount });
        });

        socket.on('chat message', (msg) => {
            const player = socket.data.player;
            const name = player ? player.name : 'Anonymous';
            io.emit('chat message', {
                name,
                time: Date.now(),
                msg,
                id: socket.id
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const player = socket.data.player;
            if (player) {
                io.emit('playerDisconnect', socket.id);
                io.emit('chat disconnect', {
                    time: Date.now(),
                    msg: `${player.name} disconnected`
                });
            }
             io.emit('chat online', { online: io.engine.clientsCount });
        });
    });
};

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
});

init();
