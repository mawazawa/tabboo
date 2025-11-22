/**
 * Represents a single, discrete task in the AI's action plan.
 */
export interface TaskNode {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'stale';
  // Links to the specific graph elements (nodes or relationships) this task depends on.
  assumptions: Assumption[];
  // Function to execute the task.
  execute: () => Promise<any>;
}

/**
 * Represents a piece of information from the knowledge graph that a task relies on.
 */
export interface Assumption {
  // e.g., 'NODE_PROPERTY', 'RELATIONSHIP_EXISTS'
  type: string; 
  // e.g., { nodeId: 123, property: 'name' } or { from: 123, to: 456, type: 'LIVES_AT' }
  metadata: Record<string, any>;
  // The value of the assumption at the time the plan was made.
  initialValue: any;
}

/**
 * Represents a dependency between two tasks.
 */
export interface DependencyEdge {
  from: string; // ID of the prerequisite task
  to: string;   // ID of the dependent task
}

/**
 * The RecalibrationEngine is responsible for managing the AI's action plan
 * as a dependency graph and recalculating it when assumptions change.
 */
export class RecalibrationEngine {
  private tasks: Map<string, TaskNode> = new Map();
  private dependencies: Map<string, string[]> = new Map(); // Maps a task ID to its dependents

  constructor(initialTasks: TaskNode[], initialDependencies: DependencyEdge[]) {
    this.buildGraph(initialTasks, initialDependencies);
  }

  /**
   * Builds the dependency graph from an initial set of tasks and edges.
   */
  private buildGraph(tasks: TaskNode[], edges: DependencyEdge[]): void {
    tasks.forEach(task => this.tasks.set(task.id, task));
    edges.forEach(edge => {
      if (!this.dependencies.has(edge.from)) {
        this.dependencies.set(edge.from, []);
      }
      this.dependencies.get(edge.from)!.push(edge.to);
    });
  }

  /**
   * Called when a user's clarification changes an underlying assumption.
   * It finds all affected tasks and marks them as 'stale'.
   * @param changedAssumption - The assumption that has been updated.
   */
  public handleClarification(changedAssumption: Assumption): string[] {
    const staleTasks: Set<string> = new Set();

    // Find all tasks that directly rely on the changed assumption
    for (const task of this.tasks.values()) {
      if (this.taskReliesOn(task, changedAssumption)) {
        staleTasks.add(task.id);
      }
    }

    // For each directly stale task, find all its dependents recursively
    const tasksToInvalidate = new Set(staleTasks);
    tasksToInvalidate.forEach(taskId => {
      this.invalidateDownstream(taskId, tasksToInvalidate);
    });
    
    // Update the status of all invalidated tasks
    tasksToInvalidate.forEach(taskId => {
        const task = this.tasks.get(taskId);
        if(task) {
            task.status = 'stale';
        }
    });

    console.log('Stale tasks after clarification:', Array.from(tasksToInvalidate));
    return Array.from(tasksToInvalidate);
  }

  /**
   * Checks if a task relies on a specific assumption.
   * This is a simplified check; a real implementation would be more robust.
   */
  private taskReliesOn(task: TaskNode, assumption: Assumption): boolean {
    return task.assumptions.some(a => 
      a.type === assumption.type &&
      JSON.stringify(a.metadata) === JSON.stringify(assumption.metadata)
    );
  }

  /**
   * Recursively finds all tasks that depend on a given task and adds them to the stale set.
   * @param taskId - The ID of the task to start from.
   * @param staleSet - The set of task IDs to add to.
   */
  private invalidateDownstream(taskId: string, staleSet: Set<string>): void {
    const dependents = this.dependencies.get(taskId);
    if (dependents) {
      dependents.forEach(dependentId => {
        if (!staleSet.has(dependentId)) {
          staleSet.add(dependentId);
          this.invalidateDownstream(dependentId, staleSet);
        }
      });
    }
  }

  /**
   * Returns the current state of the task graph.
   */
  public getTaskGraph(): { tasks: TaskNode[], dependencies: DependencyEdge[] } {
      const tasks = Array.from(this.tasks.values());
      const dependencies: DependencyEdge[] = [];
      this.dependencies.forEach((toList, from) => {
          toList.forEach(to => dependencies.push({from, to}))
      });
      return { tasks, dependencies };
  }
}
