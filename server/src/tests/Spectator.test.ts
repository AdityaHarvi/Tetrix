import { Spectator } from "../Spectator";
import { Level } from "../Level";
import { SocketServerMock } from "socket.io-mock-ts";

describe("Testing 'Spectator'", () => {
    let spectator: Spectator;
    let clientSocket: any;
    let serverSocket: any;
    const level: Level = new Level(jest.fn());

    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
    jest.spyOn(global, "setInterval");

    beforeAll(() => {
        serverSocket = new SocketServerMock();
        clientSocket = serverSocket.clientMock;
    });

    beforeEach(() => {
        spectator = new Spectator(
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn()
        );
    });

    test("Test vote event", () => {
        const getResult = jest.spyOn(spectator, "getResult");

        spectator.initSocketListeners(clientSocket);
        clientSocket.emit("vote", () => {
            expect(getResult).toHaveBeenCalled();
        });
    });

    test("Test requestVotingSequence event", () => {
        spectator.initSocketListeners(clientSocket);
        clientSocket.emit("requestVotingSequence");
        serverSocket.once("showVotingSequence");
    });

    test("Test if Voting State is Maintained", () => {
        expect(spectator.isVoteRunning()).toBe("");
        spectator.generateFirstVotingSequence(level);
        expect(spectator.isVoteRunning()).toBe("initialDisplay");
    });

    test("Test First Voting Sequence", () => {
        expect(spectator.countdownValue).toBe(10);
        spectator.generateFirstVotingSequence(level);

        jest.runAllTimers();
        expect(spectator.countdownValue).toBe(9);

        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 12000);
    });

    test("Reset Voting Data Before Starting Another", () => {
        expect(spectator.countdownValue).toBe(10);
        spectator.generateFirstVotingSequence(level);
        jest.runAllTimers();
        expect(spectator.countdownValue).toBe(9);
        spectator.generateFirstVotingSequence(level);
        expect(spectator.countdownValue).toBe(10);
    });

    test("Test Second Voting Sequence", () => {
        expect(spectator.countdownValue).toBe(10);
        spectator.generateSecondVotingSequence("", level);

        jest.runAllTimers();
        expect(spectator.countdownValue).toBe(9);

        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 12000);
    });

    test("Test Voting Loop", () => {
        spectator.startVotingLoop(level);
        expect(setInterval).toHaveBeenCalled();
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 44000);
    });

    test("Test Ensure Voting Sequence is Reset When Starting a Voting Sequence", () => {
        const resetVotingRound = jest.spyOn(
            Spectator.prototype as any,
            "resetVotingRound"
        );

        spectator.generateFirstVotingSequence(level);
        expect(resetVotingRound).toHaveBeenCalled();

        spectator.generateSecondVotingSequence("", level);
        expect(resetVotingRound).toHaveBeenCalled();
    });

    test("Test Voting Decision - IncreaseFallRate", () => {
        const increaseFallRate = jest.spyOn(level, "spectatorIncreaseFallRate");
        const secondVotingSequence = jest.spyOn(
            spectator,
            "generateSecondVotingSequence"
        );

        expect(spectator.isVoteRunning()).toBe("");
        spectator.startVotingLoop(level);
        spectator.generateFirstVotingSequence(level);
        expect(spectator.isVoteRunning()).toBe("initialDisplay");
        spectator.getResult("option1");
        spectator.makeDecision(level);
        expect(spectator.isVoteRunning()).toBe("fallRate");

        // Second voting round should commence.
        expect(secondVotingSequence).toHaveBeenCalled();

        // Simulate a vote on "option1" (increase fall rate).
        spectator.getResult("option1");
        spectator.makeDecision(level);

        expect(increaseFallRate).toHaveBeenCalled();
    });

    test("Test Voting Decision - DecreaseFallRate", () => {
        const decreaseFallRate = jest.spyOn(level, "spectatorDecreaseFallRate");
        const secondVotingSequence = jest.spyOn(
            spectator,
            "generateSecondVotingSequence"
        );

        expect(spectator.isVoteRunning()).toBe("");
        spectator.startVotingLoop(level);
        spectator.generateFirstVotingSequence(level);
        expect(spectator.isVoteRunning()).toBe("initialDisplay");
        spectator.getResult("option1");
        spectator.makeDecision(level);
        expect(spectator.isVoteRunning()).toBe("fallRate");

        // Second voting round should commence.
        expect(secondVotingSequence).toHaveBeenCalled();

        // Simulate a vote on "option1" (increase fall rate).
        spectator.getResult("option2");
        spectator.makeDecision(level);

        expect(decreaseFallRate).toHaveBeenCalled();
    });

    test("Test Voting Decision - Spawn New Blocks", () => {
        const secondVotingSequence = jest.spyOn(
            spectator,
            "generateSecondVotingSequence"
        );

        expect(spectator.isVoteRunning()).toBe("");
        spectator.startVotingLoop(level);
        spectator.generateFirstVotingSequence(level);
        expect(spectator.isVoteRunning()).toBe("initialDisplay");
        spectator.getResult("option2");
        spectator.makeDecision(level);
        expect(spectator.isVoteRunning()).toBe("tetrominoSelection");

        // Second voting round should commence.
        expect(secondVotingSequence).toHaveBeenCalled();

        // Simulate a vote on "option1" (increase fall rate).
        spectator.getResult("option1");
        spectator.makeDecision(level);

        expect(spectator.randTetros.length).toBe(3);
    });
});
