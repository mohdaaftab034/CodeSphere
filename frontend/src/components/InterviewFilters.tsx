import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Search, Filter } from "lucide-react"
import { Input } from "./ui/input"

interface InterviewFiltersProps {
    search: string
    setSearch: (value: string) => void
    selectedDifficulties: string[]
    setSelectedDifficulties: (values: string[]) => void
    selectedSubjects: string[]
    setSelectedSubjects: (values: string[]) => void
    availableSubjects: string[]
    selectedRoles: string[]
    setSelectedRoles: (values: string[]) => void
    availableRoles: string[]
    selectedTopics: string[]
    setSelectedTopics: (values: string[]) => void
    availableTopics: string[]
    sortBy: string
    setSortBy: (value: string) => void
    totalQuestions: number
    showMobileFilters?: boolean
    setShowMobileFilters?: (show: boolean) => void
}

export function InterviewFilters({
    search,
    setSearch,
    selectedDifficulties,
    setSelectedDifficulties,
    selectedSubjects,
    setSelectedSubjects,
    availableSubjects,
    selectedRoles,
    setSelectedRoles,
    availableRoles,
    selectedTopics,
    setSelectedTopics,
    availableTopics,
    sortBy,
    setSortBy,
    totalQuestions,
    showMobileFilters,
    setShowMobileFilters,
}: InterviewFiltersProps) {

    const difficulties = ["Beginner", "Intermediate", "Advanced"]

    const toggleDifficulty = (difficulty: string) => {
        if (selectedDifficulties.includes(difficulty)) {
            setSelectedDifficulties(selectedDifficulties.filter(d => d !== difficulty))
        } else {
            setSelectedDifficulties([...selectedDifficulties, difficulty])
        }
    }

    const toggleTopic = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            setSelectedTopics(selectedTopics.filter(t => t !== topic))
        } else {
            setSelectedTopics([...selectedTopics, topic])
        }
    }

    const toggleSubject = (subject: string) => {
        if (selectedSubjects.includes(subject)) {
            setSelectedSubjects(selectedSubjects.filter(s => s !== subject))
        } else {
            setSelectedSubjects([...selectedSubjects, subject])
        }
    }

    const toggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role))
        } else {
            setSelectedRoles([...selectedRoles, role])
        }
    }

    const clearFilters = () => {
        setSelectedDifficulties([])
        setSelectedSubjects([])
        setSelectedRoles([])
        setSelectedTopics([])
        setSearch("")
    }

    const activeFiltersCount = selectedDifficulties.length + selectedSubjects.length + selectedRoles.length + selectedTopics.length

    return (
        <div className="space-y-6">
            {/* Search - Mobile only here, Desktop usually in header or separate */}
            <div className="relative md:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filters
                    </h3>
                    {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive">
                            Clear ({activeFiltersCount})
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sort</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="az">A-Z</option>
                        <option value="za">Z-A</option>
                    </select>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Difficulty</label>
                    <div className="grid gap-2">
                        {difficulties.map((diff) => (
                            <div key={diff} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`difficulty-${diff}`}
                                    checked={selectedDifficulties.includes(diff)}
                                    onCheckedChange={() => toggleDifficulty(diff)}
                                />
                                <label
                                    htmlFor={`difficulty-${diff}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {diff}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-border my-4" />

                {/* Subject Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
                    <div className="grid gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableSubjects.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No subjects available</p>
                        ) : (
                            availableSubjects.map((subject) => (
                                <div key={subject} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`subject-${subject}`}
                                        checked={selectedSubjects.includes(subject)}
                                        onCheckedChange={() => toggleSubject(subject)}
                                    />
                                    <label
                                        htmlFor={`subject-${subject}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {subject}
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="h-px bg-border my-4" />

                {/* Role Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Role</label>
                    <div className="grid gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableRoles.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No roles available</p>
                        ) : (
                            availableRoles.map((role) => (
                                <div key={role} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role}`}
                                        checked={selectedRoles.includes(role)}
                                        onCheckedChange={() => toggleRole(role)}
                                    />
                                    <label
                                        htmlFor={`role-${role}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {role}
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="h-px bg-border my-4" />

                {/* Topics Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tags</label>
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableTopics.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No topics available</p>
                        ) : (
                            availableTopics.map((topic) => (
                                <div key={topic} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`topic-${topic}`}
                                        checked={selectedTopics.includes(topic)}
                                        onCheckedChange={() => toggleTopic(topic)}
                                    />
                                    <label
                                        htmlFor={`topic-${topic}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                                    >
                                        {topic}
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
