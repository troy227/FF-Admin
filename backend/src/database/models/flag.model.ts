import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'flags', underscored: true })
export class Flag extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column(DataType.STRING)
  declare key: string;

  /** When null, the flag applies to all users. */
  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.INTEGER))
  declare userIds: number[] | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare enabled: boolean;
}
