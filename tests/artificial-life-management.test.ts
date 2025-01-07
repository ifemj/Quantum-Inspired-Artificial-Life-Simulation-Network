import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lifeFormCount = 0;
const lifeForms = new Map();

// Simulated contract functions
function createLifeForm(genome: string, sender: string) {
  const lifeFormId = ++lifeFormCount;
  lifeForms.set(lifeFormId, {
    creator: sender,
    genome: genome,
    energy: 100,
    generation: 1,
    lastUpdate: Date.now()
  });
  return lifeFormId;
}

function updateLifeForm(lifeFormId: number, newGenome: string, energyDelta: number, sender: string) {
  const lifeForm = lifeForms.get(lifeFormId);
  if (!lifeForm) throw new Error('Invalid life form');
  if (lifeForm.creator !== sender) throw new Error('Not authorized');
  lifeForm.genome = newGenome;
  lifeForm.energy += energyDelta;
  lifeForm.lastUpdate = Date.now();
  lifeForms.set(lifeFormId, lifeForm);
  return true;
}

describe('Artificial Life Management Contract', () => {
  beforeEach(() => {
    lifeFormCount = 0;
    lifeForms.clear();
  });
  
  it('should create a new life form', () => {
    const lifeFormId = createLifeForm('ATCG', 'user1');
    expect(lifeFormId).toBe(1);
    expect(lifeForms.size).toBe(1);
    const lifeForm = lifeForms.get(lifeFormId);
    expect(lifeForm.genome).toBe('ATCG');
    expect(lifeForm.energy).toBe(100);
  });
  
  it('should update a life form', () => {
    const lifeFormId = createLifeForm('ATCG', 'user2');
    expect(updateLifeForm(lifeFormId, 'ATCGA', 10, 'user2')).toBe(true);
    const lifeForm = lifeForms.get(lifeFormId);
    expect(lifeForm.genome).toBe('ATCGA');
    expect(lifeForm.energy).toBe(110);
  });
  
  it('should not allow unauthorized updates', () => {
    const lifeFormId = createLifeForm('ATCG', 'user3');
    expect(() => updateLifeForm(lifeFormId, 'ATCGA', 10, 'user4')).toThrow('Not authorized');
  });
});

