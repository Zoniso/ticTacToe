# ticTacToe
tic tac toe game API - for 2 players

**The API requires the following DB tables:**

create table main.tic_tac_toe_game_status
(
    id VARCHAR(255) NOT NULL,
    status INT NOT NULL DEFAULT 0
);
ALTER TABLE main.tic_tac_toe_game_status ADD index (id);
ALTER TABLE main.tic_tac_toe_game_status ADD unique (id);


create table main.tic_tac_toe_statuses (
        id SMALLINT NOT NULL,
        name VARCHAR(255) NOT NULL,
        status_display_name VARCHAR(255) NOT NULL
);

INSERT INTO main.tic_tac_toe_statuses (id, name, status_display_name) VALUES
(0, 'NEW', 'New'),
(1, 'PLAYING', 'Still playing'),
(2, 'X_WINNER', 'x is the winner'),
(3, 'O_WINNER', 'o is the winner'),
(4, 'TIE', 'Tie')
;

create table main.tic_tac_toe_game_players (
  game_id VARCHAR(255) NOT NULL,
  player SMALLINT NOT NULL
);
ALTER TABLE main.tic_tac_toe_game_players MODIFY COLUMN game_id VARCHAR(255) NOT NULL;
ALTER TABLE main.tic_tac_toe_game_players ADD index (game_id);
ALTER TABLE main.tic_tac_toe_game_players
    ADD FOREIGN KEY gameId
        (game_id) REFERENCES main.tic_tac_toe_game_status(id);
ALTER TABLE  main.tic_tac_toe_game_players
    ADD FOREIGN KEY playerId
        (player) REFERENCES main.tic_tac_toe_players(id);
ALTER TABLE main.tic_tac_toe_game_players ADD unique (game_id, player);

create table main.tic_tac_toe_players (
    id SMALLINT NOT NULL,
    player_display_name VARCHAR(4) NOT NULL
);
ALTER TABLE main.tic_tac_toe_players ADD index (id);

insert into main.tic_tac_toe_players (id, player_display_name) values
(1, 'x'), (2,'o');

CREATE TABLE main.tic_tac_toe_game_board(
    game_id VARCHAR(255) NOT NULL,
    b_11 SMALLINT NULL default NULL,
    b_12 SMALLINT NULL default NULL,
    b_13 SMALLINT NULL default NULL,
    b_21 SMALLINT NULL default NULL,
    b_22 SMALLINT NULL default NULL,
    b_23 SMALLINT NULL default NULL,
    b_31 SMALLINT NULL default NULL,
    b_32 SMALLINT NULL default NULL,
    b_33 SMALLINT NULL default NULL,
    FOREIGN KEY (game_id) REFERENCES main.tic_tac_toe_game_status(id),
    index (game_id),
    unique (game_id)
);

**These are requests examples from postman:**
**create a game:**
curl --location --request POST 'https://localjs.supersonicads.com/ticTacToe' \
--data-raw ''
**join a game:**
curl --location --request POST 'https://localjs.supersonicads.com/ticTacToe/join/2b9cf67a-2b62-447e-9b4c-4c8355010536' \
--data-raw ''
**make a move:**
curl --location --request PUT 'https://localjs.supersonicads.com/ticTacToe/makeAMove/2b9cf67a-2b62-447e-9b4c-4c8355010536/o' \
--header 'Connection: keep-alive' \
--header 'Content-Type: application/json' \
--data-raw '{
    "x":3,
    "y":1
}'
**get status:**
curl --location --request GET 'https://localjs.supersonicads.com/ticTacToe/status/24d96df6-0630-4c22-948d-23f7a492e0a2' \
--data-raw ''
