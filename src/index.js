import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

/** Square: button cell with winning highlight + a11y */
function Square({ value, onClick, isWinning, index }) {
    return (
        <button
            className={`square ${value ? (value === 'X' ? 'square-x' : 'square-o') : ''} ${isWinning ? 'square-win' : ''}`}
            onClick={onClick}
            aria-label={`Cell ${index + 1} ${value ? 'contains ' + value : 'is empty'}`}
        >
            {value}
        </button>
    );
}

/** Board: renders a 3x3 grid */
class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                isWinning={this.props.winningLine && this.props.winningLine.includes(i)}
                index={i}
            />
        );
    }

    render() {
        return (
            <div className="board">
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

/** Game: stateful wrapper with history, sorting, reset, status */
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                    lastMove: null
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            isAsc: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const { winner } = calculateWinner(squares);
        if (winner || squares[i]) return;

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{ squares, lastMove: i }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0
        });
    }

    handleReset() {
        this.setState({
            history: [{ squares: Array(9).fill(null), lastMove: null }],
            stepNumber: 0,
            xIsNext: true
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const { winner, line: winningLine } = calculateWinner(current.squares);
        const isDraw = !winner && current.squares.every(Boolean);

        const moves = history.map((step, move) => {
            const colRow =
                step.lastMove !== null
                    ? ` (${(step.lastMove % 3) + 1}, ${Math.floor(step.lastMove / 3) + 1})`
                    : '';
            const desc = move ? `Move #${move}${colRow}` : 'Game start';
            return (
                <li key={move}>
                    <button
                        className={`move-btn ${move === this.state.stepNumber ? 'active-move' : ''}`}
                        onClick={() => this.jumpTo(move)}
                    >
                        {desc}
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = `🏆 Winner: ${winner}`;
        } else if (isDraw) {
            status = '🤝 Draw';
        } else {
            status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
        }

        return (
            <div className="game">
                <div className="game-board card">
                    <div className="status-bar">
                        <div className="status">{status}</div>
                        <div className="controls">
                            <button className="btn" onClick={() => this.setState({ isAsc: !this.state.isAsc })}>
                                Sort: {this.state.isAsc ? 'Asc' : 'Desc'}
                            </button>
                            <button className="btn btn-reset" onClick={() => this.handleReset()}>
                                Play Again
                            </button>
                        </div>
                    </div>

                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winningLine={winningLine || []}
                    />
                </div>

                <div className="game-info card">
                    <h3>Moves</h3>
                    <ol className="moves-list">{this.state.isAsc ? moves : [...moves].reverse()}</ol>
                </div>
            </div>
        );
    }
}

/** Winner + line for highlight */
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: lines[i] };
        }
    }
    return { winner: null, line: [] };
}

// Mount
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Game />);
