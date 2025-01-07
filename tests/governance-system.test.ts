import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let proposalCount = 0;
const proposals = new Map();
const votes = new Map();
const governanceTokenBalances = new Map();

// Constants
const VOTING_PERIOD = 1440; // 10 days in blocks (assuming 10-minute block time)

// Simulated contract functions
function createProposal(title: string, description: string, proposer: string) {
  const proposalId = ++proposalCount;
  const startBlock = Date.now();
  proposals.set(proposalId, {
    proposer,
    title,
    description,
    startBlock,
    endBlock: startBlock + VOTING_PERIOD * 600000, // Convert blocks to milliseconds
    yesVotes: 0,
    noVotes: 0,
    status: "active"
  });
  return proposalId;
}

function vote(proposalId: number, amount: number, voteType: string, voter: string) {
  const proposal = proposals.get(proposalId);
  if (!proposal) throw new Error('Proposal not found');
  if (Date.now() > proposal.endBlock) throw new Error('Voting period ended');
  if (proposal.status !== 'active') throw new Error('Proposal is not active');
  if (voteType !== 'yes' && voteType !== 'no') throw new Error('Invalid vote type');
  
  const voterBalance = governanceTokenBalances.get(voter) || 0;
  if (voterBalance < amount) throw new Error('Insufficient balance');
  
  governanceTokenBalances.set(voter, voterBalance - amount);
  
  votes.set(`${proposalId}-${voter}`, { amount, vote: voteType });
  
  if (voteType === 'yes') {
    proposal.yesVotes += amount;
  } else {
    proposal.noVotes += amount;
  }
  proposals.set(proposalId, proposal);
  return true;
}

function endProposal(proposalId: number) {
  const proposal = proposals.get(proposalId);
  if (!proposal) throw new Error('Proposal not found');
  if (Date.now() < proposal.endBlock) throw new Error('Voting period not ended');
  if (proposal.status !== 'active') throw new Error('Proposal is not active');
  
  proposal.status = proposal.yesVotes > proposal.noVotes ? 'passed' : 'rejected';
  proposals.set(proposalId, proposal);
  return true;
}

describe('Governance System Contract', () => {
  beforeEach(() => {
    proposalCount = 0;
    proposals.clear();
    votes.clear();
    governanceTokenBalances.clear();
  });
  
  it('should create a new proposal', () => {
    const proposalId = createProposal('Implement Quantum Resistant Algorithms', 'Proposal to upgrade our system with quantum-resistant algorithms', 'member1');
    expect(proposalId).toBe(1);
    const proposal = proposals.get(proposalId);
    expect(proposal.title).toBe('Implement Quantum Resistant Algorithms');
    expect(proposal.status).toBe('active');
  });
  
  it('should allow voting on proposals', () => {
    const proposalId = createProposal('Increase Quantum Simulation Budget', 'Proposal to allocate more funds for quantum simulations', 'member2');
    governanceTokenBalances.set('voter1', 1000);
    governanceTokenBalances.set('voter2', 2000);
    expect(vote(proposalId, 500, 'yes', 'voter1')).toBe(true);
    expect(vote(proposalId, 1000, 'no', 'voter2')).toBe(true);
    const proposal = proposals.get(proposalId);
    expect(proposal.yesVotes).toBe(500);
    expect(proposal.noVotes).toBe(1000);
  });
  
  it('should not allow voting with insufficient balance', () => {
    const proposalId = createProposal('Adopt New Quantum-Inspired Algorithm', 'Proposal to implement a new quantum-inspired optimization algorithm', 'member3');
    governanceTokenBalances.set('voter3', 100);
    expect(() => vote(proposalId, 200, 'yes', 'voter3')).toThrow('Insufficient balance');
  });
  
  it('should end proposal and determine result', () => {
    const proposalId = createProposal('Fund Quantum Education Program', 'Proposal to fund educational initiatives on quantum technologies', 'member4');
    governanceTokenBalances.set('voter4', 3000);
    governanceTokenBalances.set('voter5', 2000);
    vote(proposalId, 3000, 'yes', 'voter4');
    vote(proposalId, 2000, 'no', 'voter5');
    
    // Fast-forward time
    const proposal = proposals.get(proposalId);
    proposal.endBlock = Date.now() - 1000; // Set end time to 1 second ago
    proposals.set(proposalId, proposal);
    
    expect(endProposal(proposalId)).toBe(true);
    const endedProposal = proposals.get(proposalId);
    expect(endedProposal.status).toBe('passed');
  });
  
  it('should not allow voting after voting period', () => {
    const proposalId = createProposal('Establish Quantum Ethics Committee', 'Proposal to create an ethics committee for quantum research', 'member5');
    governanceTokenBalances.set('voter6', 1000);
    
    // Fast-forward time
    const proposal = proposals.get(proposalId);
    proposal.endBlock = Date.now() - 1000; // Set end time to 1 second ago
    proposals.set(proposalId, proposal);
    
    expect(() => vote(proposalId, 500, 'yes', 'voter6')).toThrow('Voting period ended');
  });
  
  it('should not allow ending proposal before voting period', () => {
    const proposalId = createProposal('Quantum Algorithm Marketplace', 'Proposal to create a marketplace for quantum algorithms', 'member6');
    expect(() => endProposal(proposalId)).toThrow('Voting period not ended');
  });
});

