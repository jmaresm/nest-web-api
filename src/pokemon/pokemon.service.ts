import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (err) {
      this.habdleExceptions(err);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(key: string) {
    let pokemon: Pokemon;

    if (!isNaN(+key)) {
      pokemon = await this.pokemonModel.findOne({ no: key });
    }

    if (isValidObjectId(key)) {
      pokemon = await this.pokemonModel.findById(key);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: key });
    }

    if (!pokemon)
      throw new NotFoundException(`Pokemon with ID ${key} not found`);

    return pokemon;
  }

  async update(key: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(key);

      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }

      await pokemon.updateOne(updatePokemonDto, { new: true });

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (err) {
      this.habdleExceptions(err);
    }
  }

  async remove(id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if (deletedCount === 0){
      throw new BadRequestException(`Pokemon with ID ${ id } not found`);
    }

    return;
  }

  private habdleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists inDB ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check serve logs`,
    );
  }
}
