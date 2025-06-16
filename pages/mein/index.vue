<template>
    <UContainer class="pt-4">
        <div class="flex gap-12">
            <div class="w-full">
                <p class="text-sm text-primary font-bold mb-2">Dashboard</p>
                <h1 class="text-4xl font-bold">Willkommen, Tin!</h1>
                <USeparator class="mt-6" />
            </div>
        </div>
        <div class="grid grid-cols-4 gap-4 mt-4">
            
            <ModuleCard title="Länder"
                description="Deine Nation in unsere Datenbank aufnehmen."
                to="/mein/laender" />
            <!--<ModuleCard title="Währungen"
                description="Die Währung deiner Nation direkt an einen Wechselkurs anbinden und mit anderen vergleichen. "
                to="/mein/waehrungen" />-->
            <ModuleCard title="Zeitungen"
                description="RSS-Feeds von deinen Zeitungen hinzufügen."
                to="/mein/zeitungen" />
            <ModuleCard title="News-Listen"
                description="RSS-Feeds von deinen Lieblingszeitungen erstellen um sie in deinem Forum einzubinden."
                to="/mein/listen" />

        </div>
    </UContainer>
</template>