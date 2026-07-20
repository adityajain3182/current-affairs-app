import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuizPaper } from '../types';
import { useProgress } from '../state/ProgressContext';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { QuestionView } from './QuestionView';
import { ResultView } from './ResultView';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';

type Phase = 'quiz' | 'result' | 'review';

export function QuizRunner({
  paper,
  onExit,
}: {
  paper: QuizPaper;
  onExit: () => void;
}) {
  const { getAttempt, ensureAttempt, answerDaily, selectWeekly, submitWeekly } =
    useProgress();
  const isDaily = paper.type === 'daily';

  const attempt = getAttempt(paper.id);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(attempt?.completed ? 'result' : 'quiz');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    ensureAttempt(paper);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper.id]);

  // Reset scroll to top whenever the question changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [index, phase]);

  const total = paper.questionCount;
  const current = paper.questions[index];
  const answers = attempt?.answers ?? {};
  const answeredCount = Object.keys(answers).length;
  const selectedIndex = answers[current?.id]?.selectedIndex ?? null;

  // Daily: reveal a question as soon as it is answered.
  // Weekly: reveal only in review (after submit).
  const revealed = isDaily ? selectedIndex !== null : phase === 'review';
  const locked = isDaily ? selectedIndex !== null : phase === 'review';

  const onSelect = (i: number) => {
    if (isDaily) answerDaily(paper, current.id, i);
    else selectWeekly(paper, current.id, i);
  };

  const goNext = () => setIndex((v) => Math.min(total - 1, v + 1));
  const goPrev = () => setIndex((v) => Math.max(0, v - 1));

  const doSubmit = () => {
    const unanswered = total - answeredCount;
    const finish = () => {
      submitWeekly(paper);
      setPhase('result');
    };
    if (unanswered > 0) {
      Alert.alert(
        'Submit test?',
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'Submit', style: 'destructive', onPress: finish },
        ],
      );
    } else {
      Alert.alert('Submit test?', 'Your answers will be locked and graded.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: finish },
      ]);
    }
  };

  // ---- Result / review phases -------------------------------------------
  if (phase === 'result' && attempt) {
    return (
      <SafeAreaView style={styles.flex} edges={['top']}>
        <Header title={paper.title} onExit={onExit} />
        <ResultView
          paper={paper}
          attempt={attempt}
          onReview={() => {
            setIndex(0);
            setPhase('review');
          }}
          onDone={onExit}
        />
      </SafeAreaView>
    );
  }

  const inReview = phase === 'review';

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Header
        title={paper.title}
        onExit={inReview ? () => setPhase('result') : onExit}
        exitIcon={inReview ? 'arrow-back' : 'close'}
        right={
          !isDaily && !inReview ? (
            <Pressable style={styles.paletteBtn} onPress={() => setPaletteOpen(true)}>
              <Ionicons name="grid-outline" size={16} color={colors.primary} />
              <Text style={styles.paletteBtnText}>
                {answeredCount}/{total}
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <View style={styles.progressWrap}>
        <ProgressBar value={total ? (index + 1) / total : 0} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {current && (
          <QuestionView
            question={current}
            index={index}
            total={total}
            selectedIndex={selectedIndex}
            revealed={revealed}
            locked={locked}
            onSelect={onSelect}
          />
        )}
        {isDaily && !inReview && selectedIndex === null && (
          <Text style={styles.hint}>Tap an option to lock your answer and reveal the details.</Text>
        )}
      </ScrollView>

      <Footer
        index={index}
        total={total}
        isDaily={isDaily}
        inReview={inReview}
        answered={selectedIndex !== null}
        onPrev={goPrev}
        onNext={goNext}
        onSubmit={doSubmit}
        onFinishDaily={() => setPhase('result')}
        onExitReview={() => setPhase('result')}
      />

      {/* Weekly question palette */}
      <Modal
        visible={paletteOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPaletteOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPaletteOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Questions</Text>
            <ScrollView contentContainerStyle={styles.grid}>
              {paper.questions.map((q, i) => {
                const done = !!answers[q.id];
                return (
                  <Pressable
                    key={q.id}
                    onPress={() => {
                      setIndex(i);
                      setPaletteOpen(false);
                    }}
                    style={[
                      styles.cell,
                      done && styles.cellDone,
                      i === index && styles.cellCurrent,
                    ]}
                  >
                    <Text style={[styles.cellText, done && styles.cellTextDone]}>{i + 1}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button title="Submit test" onPress={() => {
              setPaletteOpen(false);
              doSubmit();
            }} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Header({
  title,
  onExit,
  exitIcon = 'close',
  right,
}: {
  title: string;
  onExit: () => void;
  exitIcon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={10} onPress={onExit} style={styles.headerBtn}>
        <Ionicons name={exitIcon} size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

function Footer({
  index,
  total,
  isDaily,
  inReview,
  answered,
  onPrev,
  onNext,
  onSubmit,
  onFinishDaily,
  onExitReview,
}: {
  index: number;
  total: number;
  isDaily: boolean;
  inReview: boolean;
  answered: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onFinishDaily: () => void;
  onExitReview: () => void;
}) {
  const isLast = index >= total - 1;
  const showPrev = index > 0;

  return (
    <View style={styles.footer}>
      {showPrev ? (
        <Pressable style={styles.navBtn} onPress={onPrev}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          <Text style={styles.navBtnText}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.navSpacer} />
      )}

      <View style={styles.footerMain}>
        {inReview ? (
          isLast ? (
            <Button title="Finish review" onPress={onExitReview} />
          ) : (
            <Button title="Next" onPress={onNext} />
          )
        ) : isDaily ? (
          isLast ? (
            <Button title="See results" onPress={onFinishDaily} disabled={!answered} />
          ) : (
            <Button title="Next question" onPress={onNext} disabled={!answered} />
          )
        ) : isLast ? (
          <Button title="Submit test" onPress={onSubmit} />
        ) : (
          <Button title="Next" onPress={onNext} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { padding: 2 },
  headerTitle: { ...typography.subheading, color: colors.text, flex: 1 },
  headerRight: { minWidth: 30, alignItems: 'flex-end' },
  paletteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  paletteBtnText: { ...typography.label, color: colors.primary },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
  },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  hint: {
    ...typography.caption,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  navBtnText: { ...typography.bodyStrong, color: colors.text },
  navSpacer: { width: 0 },
  footerMain: { flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '70%',
    gap: spacing.lg,
    ...shadow.raised,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
  },
  sheetTitle: { ...typography.heading, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDone: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  cellCurrent: { borderColor: colors.primary, borderWidth: 2 },
  cellText: { ...typography.label, color: colors.textMuted },
  cellTextDone: { color: colors.primary },
});
