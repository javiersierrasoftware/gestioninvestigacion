import { Model } from 'mongoose';
import { Rubric, RubricDocument } from './schemas/rubric.schema';
import { CreateRubricDto } from './dto/create-rubric.dto';
export declare class RubricsService {
    private rubricModel;
    constructor(rubricModel: Model<RubricDocument>);
    create(createRubricDto: CreateRubricDto): Promise<Rubric>;
    findAll(): Promise<Rubric[]>;
    findOne(id: string): Promise<Rubric>;
    update(id: string, updateRubricDto: Partial<CreateRubricDto>): Promise<Rubric>;
    delete(id: string): Promise<Rubric>;
}
