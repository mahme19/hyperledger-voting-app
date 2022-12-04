

'use strict';

// Deterministic JSON.stringify()
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');



//import our file which contains our constructors and auxiliary function
let Election = require("./Election.js");
let Voter = require("./Voter.js");
let Candidate = require("./Candidate.js");


class VotingContract extends Contract {

    async init(ctx) {

        let voters = [];
        let candidates = [];
        let elections = []
        let election;

        let voter1 = await new Voter("v1", "John Doe");
        let voter2 = await new Voter("v2", "Jane Doe");
        let voter3 = await new Voter("v3", "John Roe");

        voters.push(voter1);
        voters.push(voter2);
        voters.push(voter3);

        await ctx.stub.putState(
            voter1.voterId,
            Buffer.from(JSON.stringify(voter1))
        );
        await ctx.stub.putState(
            voter2.voterId,
            Buffer.from(JSON.stringify(voter2))
        );
        await ctx.stub.putState(
            voter3.voterId,
            Buffer.from(JSON.stringify(voter3))
        );

        let currentElections = JSON.parse(
            await this.queryByObjectType(ctx, "election")
        );

        if (currentElections.length === 0) {
            election = await new Election(
                "Folketingsvalg",
                "2022"
            );
            elections.push(election)


            await ctx.stub.putState(
                election.electionId,
                Buffer.from(JSON.stringify(election))
            );
        } else {
            election = currentElections[0]
        }

        let socialDemokratiet = await new Candidate(
            ctx,
            "A",
            "Socialdemokratiet"
        );
        let moderaterne = await new Candidate(
            ctx,
            "M",
            "Moderaterne"
        );
        let radikale = await new Candidate(
            ctx,
            "B",
            "Radikale Venstre"
        );
        let konservative = await new Candidate(
            ctx,
            "C",
            "Det Konservative Folkeparti"
        );
        let venstre = await new Candidate(
            ctx,
            "V",
            "Venstre"
        );

        candidates.push(socialDemokratiet);
        candidates.push(moderaterne);
        candidates.push(radikale);
        candidates.push(konservative);
        candidates.push(venstre);

        for (let i = 0; i < candidates.length; i++) {
            await ctx.stub.putState(
                candidates[i].candidateId,
                Buffer.from(JSON.stringify(candidates[i]))
            );
        }

        return voters;
    }


    async vote(ctx, args) {

        args = JSON.parse(args);



        let candidateId = args.candidateId;
        if (candidateId == undefined) {
            return {
                error: "Candidate missing"
            }
        }

        let voterId = args.voterId

        if (voterId == undefined) {
            return {
                error: "Voter missing"
            }
        }
        let tempVoter = await ctx.stub.getState(voterId);
        let voter = await JSON.parse(tempVoter);

        if (voter.hasVoted) {
            return {
                error: "Voter has already voted in this election"
            }

        }

        let candidateExist = await this.myAssetExists(ctx, candidateId);

        if (!candidateExist) {
            return {
                error: "Candidate id does not exist"
            };
        }

        let tempCandidate = await ctx.stub.getState(candidateId);
        let candidate = await JSON.parse(tempCandidate);

        await candidate.count++;

        let updateCount = await ctx.stub.putState(
            candidateId,
            Buffer.from(JSON.stringify(candidate))
        );

        console.log(updateCount);

        voter.hasVoted = true;
        voter.vote = {};
        voter.vote = args.candidateId;

        let updateVoter = await ctx.stub.putState(
            voterId,
            Buffer.from(JSON.stringify(voter))
        );
        console.log(updateVoter);
        return voter;

    }


    async createVoter(ctx, args) {

        args = JSON.parse(args);

        let newVoter = await new Voter(
            args.voterId,
            args.name
        );

        await ctx.stub.putState(
            newVoter.voterId,
            Buffer.from(JSON.stringify(newVoter))
        );

        let message = `voterId ${newVoter.voterId} is added to world state`;

        return message
    }

    async readMyAsset(ctx, myAssetId) {

        const exists = await this.myAssetExists(ctx, myAssetId);

        if (!exists) {
            // throw new Error(`The my asset ${myAssetId} does not exist`);
            let response = {};
            response.error = `The my asset ${myAssetId} does not exist`;
            return response;
        }

        const buffer = await ctx.stub.getState(myAssetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
    

    async myAssetExists(ctx, myAssetId) {
        const buffer = await ctx.stub.getState(myAssetId);
        return !!buffer && buffer.length > 0;
    }

    async queryByObjectType(ctx, objectType) {
        let queryString = {
            selector: {
                type: objectType,
            },
        };

        let queryResults = await this.queryWithQueryString(
            ctx,
            JSON.stringify(queryString)
        );
        return queryResults;
    }

    async queryWithQueryString(ctx, queryString) {

        let resultsIterator = await ctx.stub.getQueryResult(queryString);

        let allResults = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                console.log(res.value.value.toString("utf8"));

                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(
                        res.value.value.toString("utf8")
                    );
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString("utf8");
                }

                allResults.push(jsonRes);
            }
            if (res.done) {
                await resultsIterator.close();
                return JSON.stringify(allResults);
            }
        }
    }

    async queryAll(ctx) {
        let queryString = {
            selector: {},
        };

        let queryResults = await this.queryWithQueryString(
            ctx,
            JSON.stringify(queryString)
        );
        return queryResults;
    }
}
module.exports = VotingContract;
