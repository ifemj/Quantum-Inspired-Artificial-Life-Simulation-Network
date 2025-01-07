import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Simulated contract functions
function mint(name: string, description: string, imageUrl: string, lifeFormId: number, sender: string) {
  if (sender !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  const tokenId = ++lastTokenId;
  tokenMetadata.set(tokenId, { name, description, imageUrl, lifeFormId });
  tokenOwners.set(tokenId, sender);
  return tokenId;
}

function transfer(tokenId: number, recipient: string, sender: string) {
  if (tokenOwners.get(tokenId) !== sender) throw new Error('Not authorized');
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('Artificial Life NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new NFT', () => {
    const tokenId = mint('Life Form 1', 'A unique life form', 'http://example.com/image.png', 1, 'CONTRACT_OWNER');
    expect(tokenId).toBe(1);
    expect(tokenOwners.get(tokenId)).toBe('CONTRACT_OWNER');
    const metadata = tokenMetadata.get(tokenId);
    expect(metadata.name).toBe('Life Form 1');
    expect(metadata.lifeFormId).toBe(1);
  });
  
  it('should transfer an NFT', () => {
    const tokenId = mint('Life Form 2', 'Another unique life form', 'http://example.com/image2.png', 2, 'CONTRACT_OWNER');
    expect(transfer(tokenId, 'user1', 'CONTRACT_OWNER')).toBe(true);
    expect(tokenOwners.get(tokenId)).toBe('user1');
  });
  
  it('should not allow unauthorized minting', () => {
    expect(() => mint('Unauthorized', 'This should fail', 'http://example.com/fail.png', 3, 'user2')).toThrow('Not authorized');
  });
});

