#!/usr/bin/env node

/**
 * Wiki Integration 测试
 */

import { HarnessOrchestrator } from '../harness/orchestrator.js';

// ============================================================================
// 测试
// ============================================================================

async function test() {
  console.log('🧪 测试 Wiki 集成...\n');

  const orchestrator = new HarnessOrchestrator({
    maxParallel: 3,
    wikiEnabled: true,
    wiki: {
      autoIngest: true,
      autoUpdateEntities: ['TestEntity'],
      autoUpdateConcepts: ['TestConcept'],
    },
  });

  const result = await orchestrator.execute({
    task: '测试 Wiki 集成',
    pattern: 'parallel',
    subTasks: [
      { task: '子任务 1', agent: 'agent1' },
      { task: '子任务 2', agent: 'agent2' },
    ],
    wiki: {
      autoIngest: true,
      category: 'queries',
    },
  });

  console.log('\n📊 结果:');
  console.log(`   完成：${result.completed}/${result.total}`);
  console.log(`   耗时：${result.totalDuration}ms`);
  console.log('\n✅ Wiki 集成测试完成！\n');
}

test().catch(console.error);
