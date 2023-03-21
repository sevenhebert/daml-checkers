import React from "react";
import Chessboard, { Piece as CPiece, Position } from "chessboardjsx";
import { Coord, Piece, PieceType, Player } from "@daml.js/game/lib/Types";
import { userContext } from "./App";
import { Checkers } from "@daml.js/game";
import { Move } from "@daml.js/game/lib/Checkers";
import { ContractId } from "@daml/types";

type Props = {
  contractId: ContractId<Checkers.Game>;
  game: Checkers.Game;
};

const GameBoard: React.FC<Props> = ({ contractId, game }) => {
  const user = userContext.useParty();
  const ledger = userContext.useLedger();
  const { gameId, state } = game;
  const { pieces, player } = state;
  const activePlayer = gameId.red === user ? "Red" : "Black";
  const side = gameId.red === user ? "white" : "black";
  const isActivePlayer = activePlayer === player;

  const position = pieces.reduce((result: Position, currentPiece: Piece) => {
    const { coord, owner, tp } = currentPiece;
    const color = owner === Player.Red ? "w" : "b";
    const type = tp === PieceType.Pawn ? "P" : "K";
    const piece = (color + type) as CPiece;
    result[coord.toLowerCase()] = piece;
    return result;
  }, {});

  const exerciseMove = async (
    contractId: ContractId<Checkers.Game>,
    move: Move
  ) => {
    await ledger.exercise(
      Checkers.Game.Move,
      contractId,
      move
    )
    .catch(err => console.log(err.message))
  };

  const onDrop = ({
    sourceSquare,
    targetSquare,
    piece,
  }: {
    sourceSquare: string;
    targetSquare: string;
    piece: CPiece;
  }) => {
    const from = Coord.decoder.runWithException(sourceSquare.toUpperCase());
    const to = Coord.decoder.runWithException(targetSquare.toUpperCase());

    delete position[sourceSquare];

    exerciseMove(contractId, { move: { from, to } })
      .then((res) => (position[targetSquare] = piece))
      .catch((err) => {
        console.error(err);
        position[sourceSquare] = piece;
      });
  };

  return (
    <div className="game-board">
      <Chessboard
        width={400}
        allowDrag={() => isActivePlayer}
        boardStyle={{ margin: "auto" }}
        onDrop={onDrop}
        orientation={side}
        position={position}
      />
    </div>
  );
};

export default GameBoard;
