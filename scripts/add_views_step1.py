import sys

path = 'apps/web/src/pages/demo/InteractiveDemoPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update useDemoStore destructuring
old_destruct = """    designerVersion,
    designerStatus,
    customFeeHeads,"""

new_destruct = """    designerVersion,
    designerStatus,
    customFeeHeads,
    acceptanceTestState,
    runAcceptanceTestPayment1,
    runAcceptanceTestPayment2,
    resetAcceptanceTest,
    getStudentConsolidatedStatement,
    individualProgressCards,
    consolidatedProgressCards,
    competitiveReports,
    migrationBatches,
    resolveMigrationCandidate,
    executeMigrationBatch,"""

content = content.replace(old_destruct, new_destruct)

# 2. Add local state for the new features
old_fee_state = """  // Fee Management & Receipt Generation State
  const [feeSubTab, setFeeSubTab] = useState<'collection' | 'register' | 'consolidated' | 'dues' | 'structures'>('collection');"""

new_fee_state = """  // Fee Management & Receipt Generation State
  const [feeSubTab, setFeeSubTab] = useState<'statement' | 'collection' | 'register' | 'consolidated' | 'dues' | 'structures'>('statement');
  const [selectedStatementStudentId, setSelectedStatementStudentId] = useState<string>('st-rahul');
  const [acceptanceTestFeedback, setAcceptanceTestFeedback] = useState<string | null>(null);

  // Student Progress Cards State
  const [progressCardSubTab, setProgressCardSubTab] = useState<'individual' | 'consolidated' | 'competitive'>('individual');
  const [selectedProgressStudentId, setSelectedProgressStudentId] = useState<string>('st-rahul');

  // Data Migration Centre State
  const [migrationStep, setMigrationStep] = useState<number>(1);
  const [migrationFeedback, setMigrationFeedback] = useState<string | null>(null);"""

content = content.replace(old_fee_state, new_fee_state)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("State updated in InteractiveDemoPage.")

