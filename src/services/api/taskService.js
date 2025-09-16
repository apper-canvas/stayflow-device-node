import taskData from '@/services/mockData/tasks.json';

class TaskService {
constructor() {
    this.data = [...taskData];
    this.nextId = Math.max(...this.data.map(item => item.Id || 0)) + 1;
  }

delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

async getAll() {
    await this.delay();
    return [...this.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
async getById(id) {
    await this.delay();
    const task = this.data.find(task => task.Id === parseInt(id));
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  }
async create(taskData) {
    await this.delay();
    const newTask = {
      ...taskData,
      Id: this.nextId++,
      roomId: taskData.roomId ? parseInt(taskData.roomId) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.push(newTask);
    return { ...newTask };
  }

async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(task => task.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    this.data[index] = { 
      ...this.data[index], 
      ...updateData,
      roomId: updateData.roomId ? parseInt(updateData.roomId) : this.data[index].roomId,
      updatedAt: new Date().toISOString()
    };
    return { ...this.data[index] };
  }

async delete(id) {
    await this.delay();
    const index = this.data.findIndex(task => task.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Task not found');
    }
    this.data.splice(index, 1);
    return true;
  }

async getByRoom(roomId) {
    await this.delay();
    return this.data.filter(task => task.roomId === parseInt(roomId));
  }

async getByStatus(status) {
    await this.delay();
    return this.data.filter(task => task.status.toLowerCase() === status.toLowerCase());
  }

async getByAssignee(assignedTo) {
    await this.delay();
    return this.data.filter(task => 
      task.assignedTo.toLowerCase().includes(assignedTo.toLowerCase())
    );
  }

  async getByPriority(priority) {
    await this.delay();
    return this.data.filter(task => task.priority.toLowerCase() === priority.toLowerCase());
  }

  async getHousekeepingTasks() {
    await this.delay();
    return this.data.filter(task => 
      task.title.toLowerCase().includes('clean') || 
      task.title.toLowerCase().includes('housekeeping') ||
      task.description.toLowerCase().includes('clean')
    );
  }
}

export default new TaskService();