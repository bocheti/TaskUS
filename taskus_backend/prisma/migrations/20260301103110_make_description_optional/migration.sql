-- AlterTable
ALTER TABLE "Organisation" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TaskGroup" ALTER COLUMN "description" DROP NOT NULL;
