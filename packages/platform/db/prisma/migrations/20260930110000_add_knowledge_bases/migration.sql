-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sourceType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_knowledge_binding" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_knowledge_binding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_base_teamId_idx" ON "knowledge_base"("teamId");

-- CreateIndex
CREATE INDEX "agent_knowledge_binding_agentId_idx" ON "agent_knowledge_binding"("agentId");

-- CreateIndex
CREATE INDEX "agent_knowledge_binding_knowledgeBaseId_idx" ON "agent_knowledge_binding"("knowledgeBaseId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_knowledge_binding_agentId_knowledgeBaseId_key" ON "agent_knowledge_binding"("agentId", "knowledgeBaseId");

-- AddForeignKey
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_knowledge_binding" ADD CONSTRAINT "agent_knowledge_binding_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "knowledge_base"("id") ON DELETE CASCADE ON UPDATE CASCADE;
