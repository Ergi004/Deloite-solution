import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  /** This build is single-tenant: there is always exactly one seeded company. */
  async findTheOnlyCompany(): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: {} });
    if (!company) {
      throw new NotFoundException('No company has been seeded yet');
    }
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findById(id);
    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }
}
