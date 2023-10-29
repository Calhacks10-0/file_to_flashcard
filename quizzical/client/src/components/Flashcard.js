import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';

const Flashcard = ({ flashcards, len }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (currentCard < flashcards[0].length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ padding: '10px' }}>
        <Card
          className={isFlipped ? 'flipped' : ''}
          style={{ maxWidth: '500px', maxHeight: '500px' }} // Set a maximum width
        >
          <Card.Body onClick={handleFlip}>
            <Card.Title style={{ textAlign: 'center' }}>
              {flashcards[0] && flashcards[0][currentCard]
                ? isFlipped
                  ? flashcards[0][currentCard].back
                  : flashcards[0][currentCard].front
                : 'No flashcards available'}
            </Card.Title>
          </Card.Body>
          <Card.Footer style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="primary" onClick={handlePrevCard}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNextCard}>
              Next
            </Button>
          </Card.Footer>
        </Card>
      </div>
      {flashcards.length != 0 &&
      <div style={{ textAlign: 'center', padding: '10px' }}>{currentCard+1}/{len}</div>}
    </div>
  );
};

export default Flashcard;
