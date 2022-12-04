

'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const { Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');

const VotingContract = require('../lib/votingContract.js');
let Voter = require('../lib/Voter.js');

let assert = sinon.assert;
chai.use(sinonChai);

describe('VotingContract', () => {

    let stub;
    let ctx;

    beforeEach(async () => {
        contract = new VotingContract();
        stub = sinon.createStubInstance(ChaincodeStub);

        ctx = new Context();
        ctx.setChaincodeStub(stub);
        
        let voter1 = '{"voterId":"TestVoter1, "name": "Test1"}'
        let voter2 = '{"voterId":"TestVoter2, "name": "Test2"}'
        ctx.stub.getState.withArgs('TestVoter1').resolves(Buffer.from(voter1));
        ctx.stub.getState.withArgs('TestVoter2').resolves(Buffer.from(voter2));
    });

    describe('Voter exist', () => {

        it('should return true for a voter', async () => {
            await contract.myAssetExists(ctx, 'TestVoter1').should.eventually.be.true;
            
        });

        it('should return false for a voter that does not exist', async () => {
            await contract.myAssetExists(ctx, 'TestVoter3').should.eventually.be.false;
        });

    });

    describe('Test voter' , () => {
        it('Voter object contains all relevant properties', async () => {
            let voter = new Voter("TestVoter3","Jane Roe");

            voter.should.haveOwnProperty('voterId');
            voter.should.haveOwnProperty('name');
            voter.should.haveOwnProperty('hasVoted');
        });
    })


})