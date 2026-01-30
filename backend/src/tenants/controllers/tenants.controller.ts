import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { TenantsService } from '../services/tenants.service';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Get()
    async findAll() {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const tenant = await this.tenantsService.findOne(id);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }
}
