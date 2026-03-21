import { RubricsService } from './rubrics.service';
import { CreateRubricDto } from './dto/create-rubric.dto';
export declare class RubricsController {
    private readonly rubricsService;
    constructor(rubricsService: RubricsService);
    create(createRubricDto: CreateRubricDto): Promise<import("./schemas/rubric.schema").Rubric>;
    findAll(): Promise<import("./schemas/rubric.schema").Rubric[]>;
    findOne(id: string): Promise<import("./schemas/rubric.schema").Rubric>;
    update(id: string, updateRubricDto: Partial<CreateRubricDto>): Promise<import("./schemas/rubric.schema").Rubric>;
    delete(id: string): Promise<import("./schemas/rubric.schema").Rubric>;
}
