import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsService } from 'src/questions/questions.service';
import { Repository } from 'typeorm';
import { CreateOptionInput } from './dto/create-option.input';
import { UpdateOptionInput } from './dto/update-option.input';
import { Option } from './entities/option.entity';


@Injectable()
export class OptionsService {

    constructor(
        @InjectRepository(Option) private readonly optionRepository: Repository<Option>,
        @Inject(QuestionsService) private readonly questionService: QuestionsService
    ) { }

    async create({ optionNum, paperId, questionNum, score, content }: CreateOptionInput): Promise<Option> {
        // 이 값이 있는지 체크해야 한다 
        const optionExist = await this.optionRepository.findOneBy({
            num: optionNum,
            questionNum: questionNum,
            questionPaperId: paperId
        });

        if (optionExist) {
            throw new BadRequestException(`option num ${optionNum} in question num ${questionNum} in paper id ${paperId} already exist`);
        }

        const option = await this.optionRepository.create({
            num: optionNum,
            score: score,
            content: content
        });
        const question = await this.questionService.findOneBy(questionNum, paperId);

        if (!question) {
            throw new NotFoundException('Cannot find the question. An option must be under question.')
        }

        option.question = question;
        // option.paper = question.paper;  //FIXME: 이 부분 필요한가?
        return await this.optionRepository.save(option);
    }

    async findAll(): Promise<Array<Option>> {
        return await this.optionRepository.find();
    }

    async findOneBy(optionNum: number, questionNum: number, paperId: number): Promise<Option> {
        const option = await this.optionRepository.findOneBy({
            num: optionNum,
            questionNum: questionNum,
            questionPaperId: paperId
        });

        if (!option) {
            throw new NotFoundException(`option num ${optionNum} in question ${questionNum} in paper ${paperId} not found`);
        }

        return option;
    }

    async update(optionNum: number, questionNum: number, paperId: number, updateOptionInput: UpdateOptionInput): Promise<Option> {
        const option = await this.optionRepository.findOneBy({
            num: optionNum,
            questionNum: questionNum,
            questionPaperId: paperId
        });

        if (!option) {
            throw new NotFoundException(`option num ${optionNum} in question ${questionNum} in paper ${paperId} not found`);
        }

        Object.assign(option, updateOptionInput);
        return await this.optionRepository.save(option);
    }

    async remove(optionNum: number, questionNum: number, paperId: number): Promise<Option> {
        const option = await this.optionRepository.findOneBy({
            num: optionNum,
            questionNum: questionNum,
            questionPaperId: paperId
        });

        if (!option) {
            throw new NotFoundException(`option num ${optionNum} in question ${questionNum} in paper ${paperId} not found`);
        }

        return await this.optionRepository.remove(option);
    }
}
