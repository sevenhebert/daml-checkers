import React from "react";
import { Button, List, ListItem } from "semantic-ui-react";
import { Checkers } from "@daml.js/game";
import { userContext } from "./App";
import { ContractId } from "@daml/types";
import { GameProposal } from "@daml.js/game/lib/Checkers";
import { User } from "@daml.js/game/lib/User/module";

type Props = {
  user: User | undefined
  partyToAlias: Map<string, string>;
};

const GameRequest: React.FC<Props> = ({ user, partyToAlias }) => {
  const ledger = userContext.useLedger();
  const acceptGame = async (cid: ContractId<GameProposal>): Promise<boolean> =>
    await ledger
      .exercise(Checkers.GameProposal.StartGame, cid, {})
      .then((res) => true)
      .catch((err) => {
        alert(`Unknown error:\n${JSON.stringify(err)}`);
        return false;
      });

  const declineGame = async (cid: ContractId<GameProposal>): Promise<boolean> =>
    await ledger
      .exercise(Checkers.GameProposal.DeclineGame, cid, {})
      .then((res) => true)
      .catch((err) => {
        alert(`Unknown error:\n${JSON.stringify(err)}`);
        return false;
      });

  const proposedGames = userContext.useStreamQueries(Checkers.GameProposal);

  return (
    <List relaxed>
{user && proposedGames.contracts &&
    proposedGames.contracts
    .filter(c => c.payload.proposer !== user.username)
    .map(p => (
        <ListItem
          className="test-select-message-item"
          key={p.contractId}
        >
          <span className="ui center aligned header">{p.payload.gameId.ref}</span>
          <Button
            positive
            fluid
            className="test-select-login-button"
            onClick={() => acceptGame(p.contractId)}
          >
            Accept
          </Button>
          <Button
            secondary
            fluid
            className="test-select-login-button"
            onClick={() => declineGame(p.contractId)}
          >
            Decline
          </Button>
        </ListItem>
    ))
  }  </List>
  )
};

export default GameRequest;
