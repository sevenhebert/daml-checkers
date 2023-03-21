import React from "react";
import { Form, Button } from "semantic-ui-react";
import { Party } from "@daml/types";
import { Checkers } from "@daml.js/game";
import { userContext } from "./App";
import { GameId } from "@daml.js/game/lib/Types";

type Props = {
  followers: Party[];
  partyToAlias: Map<string, string>;
};

/**
 * React component to edit a message to send to a follower.
 */
const ProposeGame: React.FC<Props> = ({ followers, partyToAlias }) => {
  const sender = userContext.useParty();
  const [receiver, setReceiver] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const ledger = userContext.useLedger()
  const proposeGame = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);

    const gameId: GameId = {
      ref: partyToAlias.get(sender) + ' vs ' + partyToAlias.get(receiver),
      red: sender,
      black: receiver
    };
    const payload = { gameId, proposer: sender };
    await ledger
      .create(Checkers.GameProposal, payload)
      .catch((error) =>
        alert(`Error sending message:\n${JSON.stringify(error)}`)
      )
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Form onSubmit={proposeGame}>
      <Form.Select
        fluid
        search
        className="test-select-message-receiver"
        value={receiver}
        options={followers.map((follower) => ({
          key: follower,
          text: partyToAlias.get(follower) ?? follower,
          value: follower,
        }))}
        onChange={(event, data) => data.value && setReceiver(data.value.toString())}
      />
      <Button
        fluid
        className="test-select-message-send-button"
        type="submit"
        disabled={isSubmitting || receiver === undefined}
        loading={isSubmitting}
        content="Request Game"
      />
    </Form>
  );
};

export default ProposeGame;
