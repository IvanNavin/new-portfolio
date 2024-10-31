-- CreateTable
CREATE TABLE "pokedex_pokemon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "name_clean" TEXT NOT NULL,
    "abilities" TEXT[],
    "types" TEXT[],
    "img" TEXT,
    "base_experience" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "special_attack" INTEGER NOT NULL,
    "special_defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,

    CONSTRAINT "pokedex_pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "language_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_card" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "remembered" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "language_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "language_user_email_key" ON "language_user"("email");

-- AddForeignKey
ALTER TABLE "language_card" ADD CONSTRAINT "language_card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "language_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
