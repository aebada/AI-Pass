-- CreateTable
CREATE TABLE "tool" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputSchema" JSONB NOT NULL,
    "kind" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_tool_binding" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_tool_binding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tool_teamId_idx" ON "tool"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "tool_teamId_slug_key" ON "tool"("teamId", "slug");

-- CreateIndex
CREATE INDEX "agent_tool_binding_agentId_idx" ON "agent_tool_binding"("agentId");

-- CreateIndex
CREATE INDEX "agent_tool_binding_toolId_idx" ON "agent_tool_binding"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_tool_binding_agentId_toolId_key" ON "agent_tool_binding"("agentId", "toolId");

-- AddForeignKey
ALTER TABLE "tool" ADD CONSTRAINT "tool_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tool_binding" ADD CONSTRAINT "agent_tool_binding_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
