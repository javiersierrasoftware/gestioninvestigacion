import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rubric, RubricDocument } from './schemas/rubric.schema';
import { CreateRubricDto } from './dto/create-rubric.dto';

@Injectable()
export class RubricsService {
  constructor(@InjectModel(Rubric.name) private rubricModel: Model<RubricDocument>) {}

  async create(createRubricDto: CreateRubricDto): Promise<Rubric> {
    const createdRubric = new this.rubricModel(createRubricDto);
    return createdRubric.save();
  }

  async findAll(): Promise<Rubric[]> {
    return this.rubricModel.find().exec();
  }

  async findOne(id: string): Promise<Rubric> {
    const rubric = await this.rubricModel.findById(id).exec();
    if (!rubric) {
      throw new NotFoundException(`Rubric #${id} not found`);
    }
    return rubric;
  }

  async update(id: string, updateRubricDto: Partial<CreateRubricDto>): Promise<Rubric> {
    const updatedRubric = await this.rubricModel.findByIdAndUpdate(id, updateRubricDto, { new: true }).exec();
    if (!updatedRubric) {
      throw new NotFoundException(`Rubric #${id} not found`);
    }
    return updatedRubric;
  }

  async delete(id: string): Promise<Rubric> {
    const deletedRubric = await this.rubricModel.findByIdAndDelete(id).exec();
    if (!deletedRubric) {
      throw new NotFoundException(`Rubric #${id} not found`);
    }
    return deletedRubric;
  }
}
